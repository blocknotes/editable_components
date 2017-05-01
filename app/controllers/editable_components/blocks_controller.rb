module EditableComponents
  class BlocksController < ActionController::Base
    protect_from_forgery with: :exception

    def publish
      model = params[:container].camelcase.constantize rescue nil
      if model && model.ancestors.include?( EditableComponents::Concerns::Editable )
        container = model.find params[:container_id]
        ver = EditableComponents.publish( container, params[:version] )
        respond_to do |format|
          # format.html { redirect_to page_path( @page, version: ver ), notice: "Version: #{ver}" }
          format.html { redirect_back fallback_location: '/', notice: "Version: #{ver}" }
          format.json { render json: { status: :ok }, status: :ok }  # , location: container
        end
      end
      # TODO: set errors if not a valid model
    end

    def update
      model = params[:container].camelcase.constantize rescue nil
      if model && model.ancestors.include?( EditableComponents::Concerns::Editable )
        container = model.find params[:container_id]
        respond_to do |format|
          if EditableComponents.update( container, params )
            format.html { redirect_back fallback_location: '/', notice: 'Saved.' }
            format.json { render json: { status: :ok }, status: :ok }  # , location: container
          else
            format.html { redirect_back fallback_location: '/', notice: container.errors.messages[:base].join( ' - ' ) }
            format.json { render json: container.errors, status: :unprocessable_entity }
          end
        end
      end
      # TODO: set errors if not a valid model
    end
  end
end
