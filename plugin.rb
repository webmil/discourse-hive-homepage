# name: discourse-hive-homepage
# about: Show custom Hiveon homepage
# version: 1.0
# author: Webmil
# url: https://gitlab.com/webmil/discourse-hive-homepage

enabled_site_setting :hive_homepage_enabled
PLUGIN_NAME = "hive_homepage".freeze

register_asset "stylesheets/hive-homepage-base.scss"
register_asset "javascripts/hive-homepage-base.js"
