$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "editable_components/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "editable_components"
  s.version     = EditableComponents::VERSION
  s.authors     = ["Mat"]
  s.email       = ["mat@blocknot.es"]
  s.homepage    = "https://github.com/blocknotes/editable_components"
  s.summary     = "EditableComponents"
  s.description = "UI components editable from the front-end for Rails"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", ">= 4.2"
  s.add_dependency "amoeba", "~> 3.0.0"
  # s.add_dependency "mongoid", "~> 6.0.3"
end
