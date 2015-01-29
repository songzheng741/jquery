
module.exports = function( Release ) {

	var
		files = [ "dist/jquery.js", "dist/jquery.min.js", "dist/jquery.min.map" ],
		cdn = require( "./release/cdn" ),
		dist = require( "./release/dist" ),
		ensureSizzle = require( "./release/ensure-sizzle" ),

		npmTags = Release.npmTags,
		createTag = Release._createTag;

	Release.define({
		npmPublish: true,
		issueTracker: "github",
		/**
		 * Ensure the repo is in a proper state before release
		 * @param {Function} callback
		 */
		checkRepoState: function( callback ) {
			ensureSizzle( Release, callback );
		},
		/**
		 * The tag for compat is different
		 * This sets a different new version for the source repo,
		 * but after building with the correct tag
		 * e.g. 3.0.0-compat
		 */
		_createTag: function( paths ) {
			Release.distVersion = Release.newVersion;
			Release.newVersion = Release.newVersion
				.replace( /(\d+\.\d+\.\d+)/, "$1-compat" );
			return createTag( paths );
		},
		/**
		 * Generates any release artifacts that should be included in the release.
		 * The callback must be invoked with an array of files that should be
		 * committed before creating the tag.
		 * @param {Function} callback
		 */
		generateArtifacts: function( callback ) {
			Release.exec( "grunt", "Grunt command failed" );
			cdn.makeReleaseCopies( Release );
			callback( files );
		},
		/**
		 * Acts as insertion point for restoring Release.dir.repo
		 * It was changed to reuse npm publish code in jquery-release
		 * for publishing the distribution repo instead
		 */
		npmTags: function() {
			// origRepo is not defined if dist was skipped
			Release.dir.repo = Release.dir.origRepo || Release.dir.repo;
			return npmTags();
		},
		/**
		 * Publish to distribution repo and npm
		 * @param {Function} callback
		 */
		dist: function( callback ) {
			dist( Release, callback );
		}
	});
};

module.exports.dependencies = [
	"archiver@0.5.2",
	"shelljs@0.2.6",
	"npm@2.3.0"
];
