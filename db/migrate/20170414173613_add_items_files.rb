class AddItemsFiles < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_file, :string  # , null: false, default: ''
  end
end
