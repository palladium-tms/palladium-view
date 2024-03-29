# Changelog

## master (unreleased)

* Added
  * Ability to create plans from interface
  * Ability to filter plans by creating type (api or manual creating)

## [0.7.1]

* Added
  * Adility to delete cases and result_sets multiple

* Changed
  * Some packages from package.json will be updated

## [0.7.0]

* Added
  * Added async loading for plan object and statistic
  * Added new button in suite menu - "Make Run".
   It need for make run from suite, and adding results for case by interface

* Changed
  * Style for selected items
  * No routing after click to selected object
  * Now new invite will generated every time, when you open this menu
  * Style of created_at in result because need to show tomesoze from settings

* Fixed
  * Fix untested filter
  * Fix: show more button is hided after click
  * Fix: more plans loading after product reopened
  * Fix: error after trying to open history for case
  * Fix: error plan name change
  * Fix: product list not updated after name changing
  * Fix: product not selected after opening by link

## [0.6.4]

* Added
  * Plan statistic update
  * Updating all statuses in one time
  * Optimisations for status loading

## Changed

* Added
  * Background colore for bode and untested status

* Fixed
  * Errors after showing more plans

## [0.6.3]

* Changed
  * Limited plans loading

## [0.6.2]

* Changed
  * Lazy loading for all routes

* Fixed
  * Clear search after run change
  * Fix: error after update result_set list with selected deleteb result_set

## [0.6.1]

* Added
  * New menu - user settings
  * Ability to change user timezone
  * Result date now use user timezone
  * Logout when token is wrong
  * Searchbar for result set toolbar

## [0.6.0] - 03.26.2019

* Added
  * Live scrolling to result set and new_result lists
  * Add new button for showing current result set
  * Add material to results.
  * Add loaders for some place
  * Change design for case list
  * Change result list for using expandable elements

* Fixed
  * Fix: result list not rendered.
  * Fix: selecting run and suile it it has same id.
  * Fix: console error after select plan and refresh.
  * Fix: results can't be updated.
  * Fix: optimize run loading. Now, you cant see runs while runs
  for other plan in loading
  * Fix: header buttons is visible after logout
  * Fix: result anf result set can't be updated after adding new result
  * Fix: trying to load results after run click

## [0.5.10] - 03.26.2019

* Added
  * New filter to result_set
  * New new copy and settings buttons for result set
  * Material for new_result result set items

* Fixed
  * Filter inverting

## [0.5.9] - 03.18.2019

* Added
  * New componens: status filter. It is status with count of elements
  * Return default untested status color to transparent
  * New settings button to plans (need to hover item for see it)
  * Add new runs and suites list (redisign for using material)

## [0.5.8] - 03.11.2019

* Fixed
  * Fix product list collapsing if plan list is empty
  * Fix: plan not selected if url is long

* Changed
  * Changed product sidenav behavior
  * Menu button can close/open sidenav.
  * Sidenav close after product pick
  * Restyle product top toolbar
  * Default empty status color is transperancy
  * Delete custom borders from element because need to use materiad elements
  * Redisign plans list for using angular material

## [0.5.7] - 01.26.2019

* Added
  * New products list
  * New sidenav

* Fixed
  * Fix product selecting after open products list
  * Fix main height now not 100%

## [0.5.6] - 01.14.2019

* Fixed
  * Errors after adding results(minification)

## [0.5.5] - 01.14.2019

* Changed
  * List of product is consist of mat-cart now
  * Product Drug and drop functions
  * Product selecting
  * Change body background color
  
## [0.5.4] - ??

* Fixed
  * Fix scroll errors after  bugfix.
  Remover main space and changed flex direction for
  all main component objects(product, run ect)

## [0.5.3] - 01.02.2019

* Changed
  * Change modal heading size because it has been ugly before changed

* Fixed
  * Fix statistic error if resilt sets statistic has
  changed, run runs list is not loaded
  * Fix errors ins scrols after chrome update(72)

## [0.5.2] - 2019-01-18

    * Accent color for fieldes on login and reguster pages
    * New case settings window

* Fixed
  * Suite and run statistic is updated after case delete
  * Error after adding resulf without result set or case selected
  * Fix: select all checkbox is not reset after refresh button click
  * Fix: error after adding result for some result sets/cases without select status

* Changed
  * Change font size to default(instred 14)

## [0.5.1] - 2019-01-18

* Changed
  * Changed new_result windows
  * Status edit dialog
  * Add error matcher global
  * Add error if status name is more 40 character

* Fixed
  * Fix wrong result size if message is long

## [0.5.0] - 2018-11-28

* Added
  * Add new status button
  * Add loading for invite, statuses and tokens dialog

* Changed
  * Update packages to 7.1.0 version
  * Update nodejs version to 10.14.0 in docker
  * Up version to 0.5.0

* Fixed
  * Added message to invite dialog if link is not found

## [0.4.6] - 2018-11-27

* Changed
  * Change bootstrap modals to angular material dialogs in token settings

* Changed
  * Get invite and generate invite methods is changed for work with await/async
  * Invite modal is rework to angular material dialog
  * About modal is rework to angular material dialog
  * Status setting modal is rework to angular material dialog
  * Delete unused scss file from invite component

## [0.4.5] - 2018-06-15

* Fixed
  * Fix opening add_result menu without result_set select
  * Fix not correct search height
  * Fix wrong sort for results in case history

* Changed
  * Changed history menu
  * Restyle login page and add reactive form to it
  * Changed checkboxes to material design

* Added
  * Add Sass pre-processor

## [0.4.4] - 2018-10-18

* Added
  * New menu for add new result

* Changed
  * Delete timezone from date
  * Update packages

## [0.4.3] - 2018-06-15

* Added
  * Loading while case is delete
  * Add "note" attr for image: annotation(:string) of image
  * Add copy button to all result_sets
  * Improved  performance of result_set list
  * Add search button
  * Add virtual scroll for runs and result_sets
  * Delete Copy button. It will be by double click.

* Fixed
  * Fixed race condition while plans load

* Changed
  * Updated package.json
  * Delete link to run in case history for all
  result sets, because link to result is more
  informative
  * Increase result details height

## [0.4.2] - 2018-04-15

* Added
  * Add material design to project
  * Changed login page by material design
  * Change registration page by material design
  * Add option for inaccurately deleting, but option not implemented to interface

* Fixed
  * Fix bug: only one history result is displayed
  * Raise condition error: elements will not merge after fast page data loading
  * Opening results without message

## [0.4.1] - 2018-03-29

* Added
  * New login page with reactive form style and material design
  * Opportunity to set developer api server for easy debug

* Fixed
  * Fixed hidden result in result list after it add
  * Fixed adding result to results list after adding it to any of result sets
  * Fix error after add result to other runs. It's
  temporary fix, will be changed in future

* Changed
  * Build setting changed. Now all production build
  will be with --prob flag (aot and etc)

## [0.4.0] - 2018-03-28

* Changed
  * Change login, registration, no_users methods like public
  * Change path strategy to no hash (without # before path)

## [0.3.9] - 2018-03-16

* Fixed
  * FIX Result message save after result add
  * Fix uncorrect plan list if product has updating fast
  * Fix opening run after create
  * Fix build errors

## [0.3.8] - 2018-02-20

* Added
  * Change statistic style
  * Add images view in result
  * Add opportunity to change product positions

* Changed
  * Synchronous filter for run and result set
  * Sorting of plans: now it sort by id (line sort by created at)
  
* Fixed
  * Error after minification: run is not hide after filter it

## [0.3.7] - 2018-02-20

* Fixed
  * Update package.json

## [0.3.6] - 2018-02-19

* Fixed
  * Fix history colors

## [0.3.5]

* Added
  * Add message to empty result_set list

* Fixed
  * Block toolbar buttons if list of plan, product, run of result-set is updated
  * Fix long status name bug
  * Fix hiding and showing result_set filter after update

## [0.3.4]

* Fixed*
  * Fix errors after trying to edit ame of product to exists name
  * Fix errors in console after click update after open/close result_set list
  * Fix errors after change run name with existed run name
  * Fix errors after change plan name with existed plan name

## [0.3.3]

* Fixed
  * Blocked status visible in add_result statuses

## [0.3.2]

* Fixed
  * Fix errors with custom error messages

## [0.3.1]

* Fixed
  * Fix result message if it unformated

## [0.3.0]

* Added
  * Custom result message

* Fixed
  * Delete phantom plan name from results
  * All requests has content type applicaction/json
  * Names can contains "+"

## [0.2.9]

* Added
  * Add opportunity to create run
* Fixed    * Errors after update element if not all elements opened

## [0.2.8]

* Added
  * Updating all childrens element after update parent element

## [0.2.7]

* Refacting
  * Refactor methods for filters

## [0.2.6]

* Fixed
  * Unselect all after add result

## [0.2.5]

* Fixed:
  * Error after case delete

## [0.2.4]

* Added
  * Styling login and registration pages
  
* Fixed  
  * Close modal window after plan deleting
  * Hidden statuses in result set if result set name is long
  * Fixed autologin after registration
  
## [0.2.3]

* Added
  * Opportunity to create status
  * Changed status settings modal
  * Added Changelog file
  * Change style from token setting modal
  * Hide registration link if any user is exist
  * Invite registration
  * Plans sorting by name
  * Add styles to login page
  * Redirect to registration page if no_users
