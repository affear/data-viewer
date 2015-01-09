#Polyphemus
The project is a simple [Docker](https://www.docker.com/) container running a [Node.js](http://nodejs.org/) webserver that servers a [Polymer](https://www.polymer-project.org/) webapp.
It's purpose is to display the data resulting from the simulation runned by [Oscard](https://github.com/affear/oscard) that are stored and exposed through RESTful APIs by [Bifrost](https://github.com/affear/bifrost).

###Setup
You simply build and run the Docker image:
```
	docker build -t polyphemus .
	docker run -it --rm -p 80:3000 --name running-polyphemus polyphemus
```
The --rm option automatically clean up and remove the container when it exists.
