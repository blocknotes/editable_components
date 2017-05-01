module EditableComponents
  class Engine < ::Rails::Engine
    isolate_namespace EditableComponents

    @@edit_mode = false

    attr_accessor :edit_mode

    initializer 'editable_components.assets.precompile' do |app|
      app.config.assets.precompile += ['editable_components/application.css', 'editable_components/application.js', 'editable_components/icomoon.eot', 'editable_components/icomoon.svg', 'editable_components/icomoon.ttf', 'editable_components/icomoon.woff']
    end

    def self.css
      'editable_components/application' if Engine.edit_mode
    end

    def self.js
      'editable_components/application' if Engine.edit_mode
    end
  end
end
