.PHONY: venv install clean build run

venv:
	python3.12 -m venv venv

install: venv
	. venv/bin/activate && pip install -r requirements.txt

build: install
	echo "Build complete."

run: install
	. venv/bin/activate && flask run

clean:
	@if [ -d "venv" ]; then \
		echo "Deactivating virtual environment..."; \
		. venv/bin/activate && deactivate; \
		echo "Removing virtual environment..."; \
		rm -rf venv; \
	else \
		echo "No virtual environment found."; \
	fi