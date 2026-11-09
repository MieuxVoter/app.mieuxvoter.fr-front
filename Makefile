# Usage: $ make

NPM := $(shell eval command -v npm)
APT := $(shell eval command -v apt)


.PHONY: help

help:  ## Usage: make <concept>, eg: make install
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


install:  ## Install required javascript dependencies
ifndef NPM
ifdef APT
	@echo "Installing NPM debian package..."
	sudo apt install -y npm
endif
endif
	npm install


demo:  ## Run locally at http://localhost:3000
	npm run dev


love:  ## Fund development of Majority Judgment
	firefox https://www.paypal.com/donate/?hosted_button_id=QD6U4D323WV4S
