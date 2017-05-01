class AddItemsFloats < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_float, :float
  end
end
