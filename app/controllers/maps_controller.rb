class MapsController < ApplicationController
	def new		
	end
  def show
    @map = Map.find(params[:id])
  end
  def index
  	@maps = Map.all
  end

  def edit
  	@map = Map.find(params[:id])
  end
  
  def update
		@map = Map.find(params[:id])

		if @map.update(map_params)
		  redirect_to @map
		else
		  render 'edit'
		end
	end
	
	def create
	  @map = Map.new(map_params)
	 
	  if @map.save
	    redirect_to @map
	  else
	    render 'new'
	  end
	end
	
	def moremaps
		@map = Map.all
	end

	private
	  def map_params
	    params.require(:map).permit(:datapoints, :maptitle)
	  end
end
