// ./test.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  duration: '1m',
  vus: 50,
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

export default function () {
  const res = http.get('https://test.k6.io');
  sleep(1);
}
