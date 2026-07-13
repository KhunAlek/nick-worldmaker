PRAGMA foreign_keys = ON;

CREATE TABLE families (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_codes (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  role TEXT NOT NULL CHECK(role IN ('parent','learner')),
  code_hash TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  role TEXT NOT NULL CHECK(role IN ('parent','learner')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mission_progress (
  family_id TEXT NOT NULL REFERENCES families(id),
  mission_id TEXT NOT NULL,
  status TEXT NOT NULL,
  hint_level INTEGER NOT NULL DEFAULT 0,
  approved_review_id TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (family_id, mission_id)
);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  mission_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  evidence_hash TEXT NOT NULL,
  suspicious_input_detected INTEGER NOT NULL DEFAULT 0,
  evaluator_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(family_id, mission_id, attempt_number)
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE REFERENCES submissions(id),
  family_id TEXT NOT NULL REFERENCES families(id),
  mission_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  model TEXT NOT NULL,
  response_json TEXT NOT NULL,
  validated INTEGER NOT NULL,
  validation_error TEXT,
  prompt_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  action TEXT NOT NULL,
  mission_id TEXT,
  submission_id TEXT,
  review_id TEXT,
  details_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX submissions_family_mission ON submissions(family_id, mission_id, attempt_number);
CREATE INDEX reviews_family_mission ON reviews(family_id, mission_id, attempt_number);
CREATE INDEX sessions_token_hash ON sessions(token_hash);
