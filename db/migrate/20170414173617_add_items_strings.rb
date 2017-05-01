class AddItemsStrings < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_string, :string  # , null: false, default: ''
  end
end
