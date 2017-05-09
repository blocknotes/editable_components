require 'active_record'
require 'amoeba'
require 'test_helper'

require 'pry'

class NavigationTest < ActionDispatch::IntegrationTest
  test "signs me in" do
    visit '/'
    binding.pry
    # expect(page).to have_content 'Success'
  end
end
