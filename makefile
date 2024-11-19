.DEFAULT_GOAL := help

.PHONY: help
help: #          Show help message for each of the Makefile recipes.
	@grep -E "^[a-z-]+: #" $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ": # "}; {printf "%s: %s\n", $$1, $$2}'

# Version read from file
VERSION := $(shell cat VERSION)

.PHONY: add-repo-tag
# Tag and push repository
add-repo-tag: #           Make an unsigned, annotated tag object
	git tag -a $(VERSION) -m "$(VERSION)"
	git push --tags
