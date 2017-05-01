class AddItemsDatetimes < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_datetime, :datetime
  end
end
