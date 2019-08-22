#!/bin/bash

function bump {
	output=$(yarn version --new-version ${release} --no-git-tag-version)
}

function help {
	echo "Usage: $(basename $0) [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]"
}

if [ -z "$1" ] || [ "$1" = "help" ]; then
	help
	exit
fi

release=$1

if [ -d ".git" ]; then
	changes=$(git status --porcelain)
	
	if [ -z "${changes}" ]; then
		bump
    yarn build
		git add -A
		git commit -m "chore(build): release ${release}"
		git tag "${release}"
		git push && git push --tags
		rm -rf ../sqs-file-uploader-proxy/plugins/file-upload/latest
		mkdir -p "../sqs-file-uploader-proxy/plugins/file-upload/${release}/dist/"
		mkdir -p ../sqs-file-uploader-proxy/plugins/file-upload/latest/dist/
		cp -a dist/ "../sqs-file-uploader-proxy/plugins/file-upload/${release}/dist/"
		cp -a dist/ ../sqs-file-uploader-proxy/plugins/file-upload/latest/dist/
		cd ../sqs-file-uploader-proxy && git add -A && git commit -m "chore(file-upload): bump to v${release}" && git push && cd --
	else
		echo "Please commit staged files prior to bumping"
	fi
else
	bump
fi