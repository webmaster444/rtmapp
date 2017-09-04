Rails.application.routes.draw do
  get 'sidebar/index'

  root to: 'visitors#index'
  devise_for :users,controllers: {:registrations => "registrations"}
  resources :users
	as :user do
	  get "/register", to: "registrations#new", as: "register"
	  get "/maps/moremaps", to: "maps#moremaps"
	end
	resources :maps do
		collection {post:import}
	end
	as :map do
		get "maps/:id/vsd", to:"maps#vsd"
		# post "maps/:id/import", to:"maps#import", as:"import_csv"
	end	
end
