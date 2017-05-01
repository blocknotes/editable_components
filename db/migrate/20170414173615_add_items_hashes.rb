class AddItemsHashes < ActiveRecord::Migration[5.0]
  def change
    add_column :editable_components_items, :data_hash, :string  # , null: false, default: ''
  end
end
