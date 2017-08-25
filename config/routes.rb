Rails.application.routes.draw do
  get 'sidebar/index'

  root to: 'visitors#index'
  devise_for :users,controllers: {:registrations => "registrations"}
  resources :users
	as :user do
	  get "/register", to: "registrations#new", as: "register"
	  get "/maps/moremaps", to: "maps#moremaps"
	end
	resources :maps
end
