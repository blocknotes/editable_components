// --- Global instance ---------------------------------------------------------
var ecMain = (function() {
  this.editing = false;
  return {
    dlgPreviewClose: function() {
      Sizzle( '[data-ec-toolbar]' )[0].style.display = 'block';
      Sizzle( '[data-ec-dlg="preview"]' )[0].style.display = 'none';
      Sizzle( '[data-ec-dlg="preview"] .c-card__body' )[0].innerHTML = '';
    },
    dlgPreviewOpen: function( target ) {
      var url = window.location.href + '?preview=1';
      Sizzle( '[data-ec-dlg="preview"] .o-modal' )[0].setAttribute( 'data-ec-target', target );
      Sizzle( '[data-ec-dlg="preview"] .c-card__body' )[0].innerHTML = '<iframe src="' + url + '"></iframe>';
      Sizzle( '[data-ec-toolbar]' )[0].style.display = 'none';
      Sizzle( '[data-ec-dlg="preview"]' )[0].style.display = 'block';
    },
    init: function() {
      Sizzle( '[data-ec-block][data-ec-container=""]' ).forEach( function( el ) {
        el.setAttribute( 'is', 'edit-block' );
      });
    },
    onPaste: function( event ) {
      event.preventDefault();
      // prevent paste HTML in contenteditable divs
      document.execCommand( 'insertText', false, ( event.originalEvent || event ).clipboardData.getData( 'text' ) );
    },
    setEditMode: function() {
      if( !this.editing ) {
        this.editing = true;
        ecVue.$mount( '[data-ec]' );
        // Drag & drop sorting
        dragula( [ Sizzle( '[data-ec-blocks]' )[0], Sizzle( '[data-ec-dlg="options"] .c-card__body' )[0] ], {
          moves: function( el, container, handle ) {
            return handle.classList.contains( 'sortable' );
          }
        });
        Sizzle( '.item-menu-add' )[0].style.display = 'inline-block';
        Sizzle( 'body' )[0].setAttribute( 'data-ec-editing', '1' );
      }
    },
    showMenu: function( menu ) {
      if( Sizzle( '[data-ec-menu-dropup="' + menu + '"]' )[0].style.display != 'block' ) {
        Sizzle( '[data-ec-dlg="menu"]' )[0].style.display = 'block';
        Sizzle( '[data-ec-menu-dropup="' + menu + '"]' )[0].style.display = 'block';
      }
      else {
        Sizzle( '[data-ec-menu-dropup="' + menu + '"]' )[0].style.display = 'none';
        Sizzle( '[data-ec-dlg="menu"]' )[0].style.display = 'none';
      }
    },
    toggleAttr: function( el, attr ) {
      var val = el.getAttribute( attr );
      el.setAttribute( attr, val ? '' : '1' );
      return !val;
    }
  }
}());

window.onload = ecMain.init();

// --- Component: edit block ---------------------------------------------------
Vue.component( 'edit-block', {
  // beforeCreate: function() { },
  mounted: function() {
    Sizzle( '[data-ec-item]', this.$el ).forEach( function( el ) {
      var input = el.getAttribute( 'data-ec-input' );
      if( input == 'html' ) {
        new MediumEditor( el, {
          toolbar: {
            buttons: [ 'bold', 'italic', 'anchor', 'h2', 'h3', 'h4', 'quote' ],
            disableEditing: true,
            spellcheck: false
          }
        });
      }
      else if( input == 'file_image' ) {
        var options = {
          headers: { 'X-CSRF-Token': Sizzle( 'meta[name="csrf-token"]' )[0].getAttribute( 'content' ) },
          method: 'patch',
          paramName: 'ec_cmp[' + el.getAttribute( 'data-ec-type' ) + '][' + el.getAttribute( 'data-ec-item' ) + ']',
          params: {},
          thumbnailWidth: null,
          url: Sizzle( '[data-ec-form]' )[0].getAttribute( 'action' ),
          init: function() {
            // this.on( 'addedfile', function( file ) { });
            this.on( 'thumbnail', function( thumbnail, dataUrl ) {
              this.element.setAttribute( 'src', dataUrl );
            });
          }
        };
        new Dropzone( el, options );
      }
      else {
        el.setAttribute( 'contenteditable', 'true' );
        el.setAttribute( 'onpaste', 'ecMain.onPaste(event)' );
      }
    });
  },
  template: '<div><slot></slot></div>'
});

// --- Component: block buttons ------------------------------------------------
Vue.component( 'block-buttons', {
  methods: {
    openDialogOptions: function() {
      this.$emit( 'open_dialog_options', this.block_id );
    }
  },
  props: [ 'block_id' ],
  template: '#ec-block-buttons-template'
});

// --- Component: new blocks ---------------------------------------------------
var ecNewBlocks = Vue.extend({
  data: function() {
    return {
      new_blocks: []
    }
  },
  methods: {
    add: function( type ) {
      this.new_blocks.push( { type: type, name: 'New ' + type.replace( /_/g, ' ' ) + ' block' } );
    },
    cancel: function( index ) {
      this.new_blocks.splice( index, 1 );
    }
  },
  template: '<div><div v-for="(block, index) in new_blocks" data-ec-new-block :data-ec-type="block.type">{{ block.name }}<button type="button" class="c-button c-button--error" v-on:click="cancel(index)"><i data-ec-icon="icon-bin"></i></button></div></div>'
});

// --- Vue entry point ---------------------------------------------------------
var ecVue = new Vue({
  // el: '[data-ec]',
  data: {
    dlg_block: 0,
    dlg_block_container: '',
    dlg_block_type: '',
    inputs: [],
    items: [],
    new_blocks: false,
    new_sub_blocks: [],
    sub_blocks: []
  },
  beforeCreate: function() {
    Sizzle( '[data-ec-block]' ).forEach( function( el ) {
      var div = document.createElement( 'div' );
      div.setAttribute( 'is', 'block-buttons' );
      div.setAttribute( 'v-on:open_dialog_options', 'dlgOptionsOpen' );
      div.setAttribute( 'block_id', el.getAttribute( 'data-ec-block' ) );
      el.appendChild( div );
    });
  },
  mounted: function() {
    this.new_blocks = new ecNewBlocks( { el: '[data-ec-new-blocks]' } );
  },
  methods: {
    addBlock: function( type ) {
      this.new_blocks.add( type )
    },
    addSubBlock: function() {
      var el = Sizzle( '[data-ec-block="' + this.dlg_block + '"]' )[0];
      var cnt = el.getAttribute( 'data-ec-new-blocks' ) ? parseInt( el.getAttribute( 'data-ec-new-blocks' ) ) : 0;
      el.setAttribute( 'data-ec-new-blocks', cnt + 1 );
      this.new_sub_blocks.push( cnt + 1 );
    },
    cancelNewSubBlock: function( index ) {
      var el = Sizzle( '[data-ec-block="' + this.dlg_block + '"]' )[0];
      var cnt = el.getAttribute( 'data-ec-new-blocks' ) ? parseInt( el.getAttribute( 'data-ec-new-blocks' ) ) : 0;
      el.setAttribute( 'data-ec-new-blocks', ( cnt > 0 ) ? ( cnt - 1 ) : 0 );
      this.new_sub_blocks.splice( index, 1 );
    },
    dlgOptionsOpen: function( blk ) {
      this.dlg_block = blk;
      var _this = this;
      var blk_el = Sizzle( '[data-ec-block="' + blk + '"]' )[0];
      Sizzle( '[data-ec-dlg="options"]' )[0].style.display = 'block';
      Sizzle( '[data-ec-toolbar]' )[0].style.display = 'none';
      this.sub_blocks = [];
      this.new_sub_blocks = [];
      this.dlg_block_container = blk_el.getAttribute( 'data-ec-container' );
      this.dlg_block_type = blk_el.getAttribute( 'data-ec-ct' ).replace( /_/g, ' ' );
      var cnt = blk_el.getAttribute( 'data-ec-new-blocks' );
      for( var i = 0; i < cnt; i++ ) this.new_sub_blocks.push( i );
      // Copy values from container to dialog
      Sizzle( '[data-ec-sub-block]', blk_el ).forEach( function( el ) {
        var items = [];
        Sizzle( '[data-ec-item]', el ).forEach( function( el2 ) {
          items.push( { type: el2.getAttribute( 'data-ec-type' ), input: el2.getAttribute( 'data-ec-input' ), item: el2.getAttribute( 'data-ec-item' ), src: el2.getAttribute( 'src' ), value: el2.innerHTML } );
        });
        _this.sub_blocks.push( { parent: blk, block: el.getAttribute( 'data-ec-sub-block' ), destroy: el.getAttribute( 'data-ec-destroy' ), items: items } );
      });
    },
    dlgOptionsClose: function() {
      // Sync changes
      var cnt = 0;
      Sizzle( '[data-ec-dlg="options"] [data-ec-sub-block]' ).forEach( function( el ) {
        Sizzle( '[data-ec-sub-block="' + el.getAttribute( 'data-ec-sub-block' ) + '"]' )[0].setAttribute( 'data-ec-position', cnt++ );
      });
      Sizzle( '[data-ec-dlg="options"] [data-ec-item]' ).forEach( function( el ) {
        if( el.getAttribute( 'data-ec-input' ) != 'file_image' ) {
          Sizzle( '[data-ec-block] [data-ec-item="' + el.getAttribute( 'data-ec-item' ) + '"]' )[0].innerHTML = el.innerHTML;
        }
        else {
          Sizzle( '[data-ec-block] [data-ec-item="' + el.getAttribute( 'data-ec-item' ) + '"]' )[0].setAttribute( 'src', el.getAttribute( 'src' ) );
        }
      });
      // Reorder nodes in-place
      var new_node = document.createElement( 'div' );
      new_node.setAttribute( 'data-ec-sort', '' );
      var node = Sizzle( '[data-ec-block="' + this.dlg_block + '"] [data-ec-sub-block]' )[0];
      if( node ) {
        var parent = node.parentNode;
        parent.insertBefore( new_node, node );   // Create a temp node as base
        var nodes = Array.prototype.slice.call( Sizzle( '[data-ec-block="' + this.dlg_block + '"] [data-ec-sub-block]' ) );
        var nodes2 = nodes.sort( function( a, b ) {
          return a.getAttribute( 'data-ec-position' ) >= b.getAttribute( 'data-ec-position' );
        });
        nodes2.forEach( function( el ) {
          parent.insertBefore( el, new_node );
        });
        parent.removeChild( new_node );
      }
      //
      Sizzle( '[data-ec-toolbar]' )[0].style.display = 'block';
      Sizzle( '[data-ec-dlg="options"]' )[0].style.display = 'none';
      this.dlg_block = 0;
    },
    onSubmit: function( event ) {
      // event.preventDefault();

      var cmp = this;
      this.inputs = [];
      // Update items
      Sizzle( '[data-ec-item]' ).forEach( function( el ) {
        var input = el.getAttribute( 'data-ec-input' );
        if( input != 'file' && input != 'file_image' ) {
          cmp.inputs.push( { name: 'ec_cmp[' + el.getAttribute( 'data-ec-type' ) + '][' + el.attributes['data-ec-item'].value + ']', value: el.innerHTML } );
        }
      });
      // Update positions
      var last = Sizzle( '[data-ec-block]' ).length;
      Sizzle( '[data-ec-block]' ).forEach( function( el ) {
        cmp.inputs.push( { name: 'ec_cmp[Block][' + el.attributes['data-ec-block'].value + '][position]', value: last-- } );
        var last2 = Sizzle( '[data-ec-sub-block]', el ).length;
        if( last2 ) {
          Sizzle( '[data-ec-sub-block]', el ).forEach( function( el2 ) {
            var sid = el2.getAttribute( 'data-ec-sub-block' );
            cmp.inputs.push( { name: 'ec_cmp[Block][' + sid + '][position]', value: last2-- } );
          });
        }
      });
      // New blocks
      var cnt = 0;
      Sizzle( '[data-ec-new-block]' ).forEach( function( el ) {
        cmp.inputs.push( { name: 'ec_cmp[Block][0][_add][' + ( cnt++ ) + ']', value: el.getAttribute( 'data-ec-type' ) } );
      });
      // New sub blocks
      Sizzle( '[data-ec-block][data-ec-new-blocks]' ).forEach( function( el ) {
        cnt = parseInt( el.getAttribute( 'data-ec-new-blocks' ) );
        for( var i = 0; i < cnt; i++ ) {
          cmp.inputs.push( { name: 'ec_cmp[Block][' + el.getAttribute( 'data-ec-block' ) + '][_add][' + i + ']', value: el.getAttribute( 'data-ec-container' ) } );
        }
      });
      // Remove blocks
      Sizzle( '[data-ec-block][data-ec-destroy="1"]' ).forEach( function( el ) {
        cmp.inputs.push( { name: 'ec_cmp[Block][' + el.attributes['data-ec-block'].value + '][_destroy]', value: '1' } );
      });
      Sizzle( '[data-ec-sub-block][data-ec-destroy="1"]' ).forEach( function( el ) {
        cmp.inputs.push( { name: 'ec_cmp[Block][' + el.attributes['data-ec-sub-block'].value + '][_destroy]', value: '1' } );
      });
    },
    removeBlock: function() {
      ecMain.toggleAttr( Sizzle( '[data-ec-block="' + this.dlg_block + '"]' )[0], 'data-ec-destroy' );
    },
    removeSubBlock: function( block ) {
      var val = ecMain.toggleAttr( Sizzle( '[data-ec-block="' + this.dlg_block + '"] [data-ec-sub-block="' + block + '"]' )[0], 'data-ec-destroy' );
      Sizzle( '[data-ec-dlg="options"] [data-ec-sub-block="' + block + '"]' )[0].setAttribute( 'data-ec-destroy', val ? '1' : '' );
    }
  }
});
