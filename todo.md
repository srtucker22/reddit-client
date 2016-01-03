TODO:

separate login from other data methods

unit tests
  - services
  - directives
e2e tests

device specific UI customization

potentially redo data model for posts as object -- {id: post}
  - this will speed up save/unsave, but not by much :)

notes:
found bugs:
- wasn't updating top with unsave (missing call)
- wasn't destroying the callbacks properly --> affecting a couple things
- href target not blank
- adding favs to top even if not there
