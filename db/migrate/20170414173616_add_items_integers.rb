class AddItemsIntegers < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_integer, :integer
  end
end
