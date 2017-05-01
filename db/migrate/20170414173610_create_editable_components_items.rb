class CreateEditableComponentsItems < ActiveRecord::Migration[5.0]
  def change
    create_table :editable_components_items do |t|
      t.string :type
      t.string :name, null: false, default: 'data'
      t.integer :block_id
    end

    add_index :editable_components_items, :block_id
  end
end
