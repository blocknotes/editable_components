module EditableComponents
  module Concerns
    module Editable
      extend ActiveSupport::Concern

      included do
        # embeds_many :ec_blocks, as: :parent, cascade_callbacks: true, order: :position.desc, class_name: 'EditableComponents::Block'
        has_many :ec_blocks, as: :parent, dependent: :destroy, foreign_key: 'parent_id', class_name: Block.to_s
        accepts_nested_attributes_for :ec_blocks, allow_destroy: true

        def create_block( type = :text, params = {} )
          block = Block.new( block_type: type )
          block.name = params[:name] if params[:name]
          block.options = params[:options] if params[:options]
          block.validations = params[:validations] if params[:validations]
          ec_blocks << block
          Block::init_items block, params[:schema] if params[:schema]
          block
        end

        def current_blocks( version = 0 )
          return @current_blocks if @current_blocks
          version = 0 unless EditableComponents::Engine.edit_mode  # no admin = only current version
          @current_blocks = ec_blocks.where( version: version.to_i ).with_nested.published
        end

        def get_block( name, version = 0 )
          current_blocks( version ).each do |block|
            return block if block.name == name
          end
          nil
        end
      end
    end
  end
end
