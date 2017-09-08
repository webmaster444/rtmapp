class MapsController < ApplicationController
	def new		
	end
  def show
  	$selectedmap = Map.find(params[:id])
	@map = Map.find(params[:id])					
	unless @map.sourcefile.nil?
		open_file_name = Rails.root.join('public', 'uploads', @map.sourcefile)
		@csv_table = CSV.open(open_file_name, :headers => true).read	
	end
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
	
	def vsd
		@map = Map.find(params[:id])					
		unless @map.sourcefile.nil?
			open_file_name = Rails.root.join('public', 'uploads', @map.sourcefile)
			@csv_table = CSV.open(open_file_name, :headers => true).read	
		end
	end

	def vgs
		@map = Map.find(params[:id])	

		@trait = Trait.find(@map.trait_id)		

		unless @map.sourcefile.nil?
			open_file_name = Rails.root.join('public', 'uploads', @map.sourcefile)
			@csv_table = CSV.open(open_file_name, :headers => true).read	
		end
	end
	def moremaps
		@map = Map.all
	end

	def import		
		uploaded_io = params[:sourcefile]
		
		uploaded_file_name = Time.now.strftime("%d%m%y%H%M%S").to_s + uploaded_io.original_filename.to_s
		
		File.open(Rails.root.join('public', 'uploads', uploaded_file_name), 'wb') do |file|
		  file.write(uploaded_io.read)
		end					
		
		headers = CSV.read(Rails.root.join('public', 'uploads', uploaded_file_name), headers: true).headers
		headers.shift(4)	
		
		trait = Trait.new(trait: headers)
		trait.save
		
		@map = Map.find(params[:id])	
		if @map.update(sourcefile: uploaded_file_name,trait_id: trait.id)		
		  redirect_to @map		
		end
	end

	def ctg

	end
	private
	def map_params
		params.require(:map).permit(:datapoints, :maptitle)
	end	  
end
