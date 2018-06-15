# Changelog
## [0.4.3] - 2018-06-15
### Fixed
    *Fixed race condition while plans load
## [0.4.2] - 2018-04-15
### Added
    * Add material design to project
    * Changed login page by material design
    * Change registration page by material design
    * Add option for inaccurately deleting, but option not implemented to interface
### Fixed
    * Fix bug: only one history result is displayed
    * Raise condition error: elements will not merge after fast page data loading
    * Opening results without message
## [0.4.1] - 2018-03-29
### Added
    * New login page with reactive form style and material design
    * Opportunity to set developer api server for easy debug
### Fixed
    * Fixed hidden result in result list after it add
    * Fixed adding result to results list after adding it to any of result sets
    * Fix error after add result to other runs. It's temporary fix, will be changed in future
### Changed
    * Build setting changed. Now all production build will be with --prob flag (aot and etc)
## [0.4.0] - 2018-03-28
### Changed
    * Change login, registration, no_users methods like public
    * Change path strategy to no hash (without # before path)
## [0.3.9] - 2018-03-16
### Fixed
    * FIX Result message save after result add
    * Fix uncorrect plan list if product has updating fast
    * Fix opening run after create
    * Fix build errors
## [0.3.8] - 2018-02-20
### Added
    * Change statistic style
    * Add images view in result
    * Add opportunity to change product positions
### Changed
    * Synchronous filter for run and result set
    * Sorting of plans: now it sort by id (line sort by created at)
### Fixed
    * Error after minification: run is not hide after filter it
## [0.3.7] - 2018-02-20
### Fixed
    * Update package.json
## [0.3.6] - 2018-02-19
### Fixed
    * Fix history colors
## [0.3.5]
### Added
    * Add message to empty result_set list
### Fixed
    * Block toolbar buttons if list of plan, product, run of result-set is updated
    * Fix long status name bug
    * Fix hiding and showing result_set filter after update
## [0.3.4]
### Fixed
    * Fix errors after trying to edit ame of product to exists name
    * Fix errors in console after click update after open/close result_set list
    * Fix errors after change run name with existed run name
    * Fix errors after change plan name with existed plan name
## [0.3.3]
### Fixed
    * Blocked status visible in add_result statuses
## [0.3.2]
### Fixed
    * Fix errors with custom error messages
## [0.3.1]
### Fixed
    * Fix result message if it unformated
## [0.3.0]
### Added
    * Custom result message
### Fixed
    * Delete phantom plan name from results
    * All requests has content type applicaction/json
    * Names can contains "+"
## [0.2.9]
### Added
    * Add opportunity to create run
### Fixed
    * Errors after update element if not all elements opened
    
## [0.2.8]
### Added 
    * Updating all childrens element after update parent element
    
## [0.2.7]
### Refactor
    * Refactor methods for filters
    
## [0.2.6]
### Fixed
    * Unselect all after add result

## [0.2.5]
### Fixed:
    * Error after case delete
      
## [0.2.4]
###Added
  * Styling login and registration pages
  
### Fixed
  * Close modal window after plan deleting
  * Hidden statuses in result set if result set name is long
  * Fixed autologin after registration
  
## [0.2.3]
### Added
 * Opportunity to create status
 * Changed status settings modal
 * Added Changelog file
 * Change style from token setting modal
 * Hide registration link if any user is exist
 * Invite registration
 * Plans sorting by name
 * Add styles to login page
 * Redirect to registration page if no_users
