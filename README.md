# EditableComponents for Rails [![Gem Version](https://badge.fury.io/rb/editable_components.svg)](https://badge.fury.io/rb/editable_components)

A Ruby on Rails plugin to manage UI components editable from the front-end.

_NOTE_: this is an **ALPHA** version, major changes could happens.

Goals:

- attach the necessary data to a model transparently

- edit the UI contents directly from the pages

- simplify the components development in views

![preview](preview.png)

### Install

- Add to the Gemfile: `gem 'editable_components'`

- Copy migrations (Rails 5.x syntax, in Rails 4.x use rake): `rails editable_components:install:migrations`

- Apply them: `rake db:migrate`

- Include the concern *Editable* to your model: `include EditableComponents::Concerns::Editable`

- Add to your application layout (in head, ex. using ERB): `<%= stylesheet_link_tag( EditableComponents::Engine.css ) if EditableComponents::Engine.css %>`

- Add to your application layout (before body closing): `<%= javascript_include_tag( EditableComponents::Engine.js ) if EditableComponents::Engine.js %>`

- Add your blocks to the views (ex. in show):
```erb
<%= render layout: 'editable_components/blocks', locals: { container: @page } do |blocks| %>
  <% blocks.each do |block| %>
    <%= render partial: "editable_components/block", locals: { block: block } %>
  <% end %>
<% end %>
```

- Add some sample data (ex. Page model): `Page.first.create_block :text`

### Config

Edit the conf file: `config/initializers/editable_components.rb`

```ruby
conf = EditableComponents.config
# Adds a new custom block
conf[:ec_blocks][:custom] = {
  name: 'Custom block',
  items: {
    int1: :item_integer,
    int2: :item_integer,
    a_float: :item_float
  }
}
EditableComponents.config( { components: conf[:ec_blocks] } )
```

Create the new view blocks: `app/views/editable_components/_block_custom.html.erb`

```erb
<% if local_assigns[:block] %>
  <% block = local_assigns[:block] %>
  <div <%= block.editable %>>
    1st number: <span class="num1"<%= block.props.integers[0].editable %>><%= block.props.integers[0] %></span>
    - 2nd number: <span class="num2"<%= block.props.integers[1].editable %>><%= block.props.integers[1] %></span><br/>
    A float: <span <%= block.props.float.editable %>><%= block.props.float %></span><br/>
  </div>
<% end %>
```

##### Images

To add support for images add CarrierWave gem to your Gemfile and execute: `rails generate uploader File`

### Notes

- This is not a complete replacement for an admin interface but it could improve the usability of a CMS software or content editor

### Dev Notes

##### Structure

- Including the Editable concern to a model will add `has_many :ec_blocks` relationship (the list of blocks attached to a container) and some utility methods

- Block: an editable UI component (ex. a text with a title, a slider, a 3 column text widgets, etc.); built with a list of sub blocks (for nested components) and a list of items

- Item: a single piece of information (ex. a string, a text, a boolean, an integer, a file, etc.)

- The live editing interface uses VueJS

## Contributors

- [Mattia Roccoberton](http://blocknot.es) - creator, maintainer
