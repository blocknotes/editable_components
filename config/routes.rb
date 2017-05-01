EditableComponents::Engine.routes.draw do
  match 'ec_update/:container/:container_id', to: 'blocks#update', via: [ :patch, :put ], as: :ec_update
  post 'ec_publish/:container/:container_id', to: 'blocks#publish', as: :ec_publish
end
