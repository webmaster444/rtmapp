Rails.application.routes.draw do
  root to: 'visitors#index'
  devise_for :users,controllers: {:registrations => "registrations"}
  resources :users
	as :user do
	  get "/register", to: "registrations#new", as: "register"
	end
end
