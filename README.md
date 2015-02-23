#Polyphemus
The project is a simple [Docker](https://www.docker.com/) container running a [Node.js](http://nodejs.org/) webserver that servers a [Polymer](https://www.polymer-project.org/) webapp.
It's purpose is to display the data resulting from the simulation runned by [Oscard](https://github.com/affear/oscard) that are stored and exposed through RESTful APIs by [Bifrost](https://github.com/affear/bifrost).

###Setup
Clone the repo, build and run the Docker image:
```
	git clone https://github.com/affear/polyphemus.git
	cd polyphemus
	docker build -t affear/polyphemus:alpha .
	docker run -it --rm -p 80:3000 --name running-polyphemus affear/polyphemus:alpha
```

If you don't want to clone the repo but just run Polyphemus, launch only
```
	docker run -it --rm -p 80:3000 --name running-polyphemus affear/polyphemus:alpha
```
and the image will be downloaded from DockerHub.

The --rm option automatically clean up and remove the container when it exists.

If you are developing (run it from the project root):
```
	docker run --rm -ti -v $(pwd)/app:/app -v $(pwd)/scripts:/scripts -p 80:3000 affear/polyphemus:alpha
```
The -v option maps your local folders to the corresponding ones in the container allowing you to see real time code changes.