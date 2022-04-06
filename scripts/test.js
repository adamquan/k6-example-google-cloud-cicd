import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const options = {
  // Scale to 2 VUs over 10s, keep those 2 VUs for 20s and scale down over 10s
  "stages": [
    { "target": 2, "duration": "10s" }, // ramp-up
    { "target": 2, "duration": "20s" }, // steady
    { "target": 0, "duration": "10s" }  // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
  ext: {
    loadimpact: {
      apm: [
        {
          provider: 'prometheus',
          remoteWriteURL: 'https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push',
          credentials: {
            username: '330312',
            password: 'eyJrIjoiOWYzMmViNDMwNGMzZjM5ZDZjY2JiZTUwZDI4YTlmMDY3MTlkZGM3YSIsIm4iOiJhcXVhbi1lYXN5c3RhcnQtcHJvbS1wdWJsaXNoZXIiLCJpZCI6NjAxMzgwfQ==',
          },
          // optional parameters
          metrics: ['http_req_duration', 'http_reqs', 'http_req_failed', 'vus', 'iterations', 'data_sent', 'data_received'], // ...
          includeDefaultMetrics: true,
          includeTestRunId: false,
        },
      ],
    },
  },
};

// K6 "Rate" metric for counting Javascript errors during a test run.
var script_errors = Rate("script_errors");

// Wraps a K6 test function with error counting.
function wrapWithErrorCounting(fn) {
  return (data) => {
    try {
      fn(data);
      script_errors.add(0);
    } catch (e) {
      script_errors.add(1);
      throw e;
    }
  }
}

// A very simple test
function simpleTest() {
  let response = http.get("https://test-api.k6.io", { "tags": { "name": "simple-test" } });
  check(response, {
    "200 OK": (r) => r.status === 200,
  });
  sleep(0.5);
}

export default wrapWithErrorCounting(simpleTest);
