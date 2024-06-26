#!/usr/bin/env bash

set -e -o pipefail

steptxt="----->"

start() {
    echo -n "$steptxt $@... "
}

finished() {
    echo "done"
}

BUILD_DIR=${1:-}
CACHE_DIR=${2:-}
ENV_DIR=${3:-}

echo_export_env_vars() {
  local BUN_INSTALL="$HOME/.bun"

  echo "export BUN_INSTALL=\$HOME/.bun"
  echo "export PATH=\$BUN_INSTALL/bin:\$PATH"
}

write_profile_d_script() {
  start "Creating .profile.d with env vars"
    mkdir -p $BUILD_DIR/.profile.d
    local profile_path="${BUILD_DIR}/.profile.d/bun_buildpack_paths.sh"

    echo_export_env_vars >> $profile_path
  finished
}

start "Installing Bun"
  curl -fsSL https://bun.sh/install | bash
finished
export BUN_INSTALL="$HOME/.bun" 
export PATH="$BUN_INSTALL/bin:$PATH"

# Build the project
cd $BUILD_DIR

start "Installing Dependencies"
  bun install
finished

start "building the app"
  bun .
finished