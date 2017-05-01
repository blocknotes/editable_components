require "editable_components/engine"

module EditableComponents
  def self.config( options = {} )
    #   p '> [TODO] EditableComponents.config'
    @@config.merge! options
    @@config
  end

  def self.publish( parent, version )
    v = version.to_i
    if v > 0
      v2 = Time.now.to_i
      parent.ec_blocks.where( version: 0 ).update_all( version: v2 )
      parent.ec_blocks.where( version: v ).update_all( version: 0 )
      v2
    else
      v = Time.now.to_i
      blocks = []
      parent.ec_blocks.where( version: 0 ).each do |block|
        blocks << block.amoeba_dup
        blocks.last.version = v
      end
      parent.ec_blocks << blocks
      parent.save
      # TODO: delete old versions
      v
    end
  end

  def self.update( parent, params )
    ret = true
    if params[:ec_cmp]
      # TODO: return false on errors and set errors
      version = params[:version].to_i
      params[:ec_cmp].each do |type, fields|
        model = ( 'EditableComponents::' + type ).constantize rescue nil
        if model
          if model.ancestors.include?( EditableComponents::Item )
            # Update an item
            fields.each do |k, v|
              item = model.find_by_id k
              if item
                if !item.update_data( v )
                  ret = false
                  parent.errors.add :base, item.errors[:base]
                end
              end
            end
          elsif type == 'Block'
            fields.each do |k, v|
              block = EditableComponents::Block.find_by_id k
              if block
                if v.delete( '_destroy' )
                  # Destroy a block
                  block.destroy
                else
                  if( add = v.delete( '_add' ) )
                    # Create new sub blocks
                    t = block.block_type.to_sym
                    add.keys.each do
                      if @@config[:ec_blocks][t] && @@config[:ec_blocks][t][:children_type]
                        sub_block = EditableComponents::Block.new( parent: block, block_type: @@config[:ec_blocks][t][:children_type], version: version, _init: true )
                        sub_block.save
                        # TODO: return errors
                      end
                    end
                  end
                  # Update a block
                  block.update( v.permit( :position, :published ) )
                end
              elsif( add = v.delete( '_add' ) )
                # Create new blocks
                add.each do |index, new_type|
                  t = new_type.to_sym
                  # TODO: check if t is a valid block type
                  EditableComponents::Block.new( parent: parent, block_type: t, version: version, _init: true ).save
                end
              end
            end
          end
        end
      end
    end
    ret
  end
end
