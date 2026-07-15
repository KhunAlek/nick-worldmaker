# Release Harness v2

Each release run creates a new isolated family UUID in production D1. The run seeds only the mission under test as NOT_SUBMITTED, deploys the Worker with that family and pilot mission, executes non-approval then approval through the normal submission route, verifies exact-next unlock and shared views, records evidence, promotes the mission, advances the pilot, deploys, verifies health, compares all non-test-family progress before and after, and commits only after every gate passes.

Release-test families are identified by display names beginning with `Release Test `. They are excluded from real-family isolation comparisons. Existing approved test families are never reused or regressed.
