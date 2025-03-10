.PHONY: venv install clean build run
.PHONY: venv install clean build run

venv:
	python3.12 -m venv venv

install: venv
	./venv/bin/pip install -r requirements.txt

build: install
	echo "Build complete."

run:
	flask run

clean:
	rm -rf venv
