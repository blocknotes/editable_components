module EditableComponents
  class ItemBoolean < Item
    alias_attribute :data, :data_boolean

    def init
      self.data = 0
      self
    end

    def update_data( value )
      self.data = ( value == 'true' ) ? 1 : 0
      self.save
    end

    def to_s
      self.data > 0 ? 'true' : 'false'
    end

    def self.type_name
      'boolean'
    end
  end
end
