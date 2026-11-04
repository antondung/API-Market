import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock Component - Copy Feedback & Rejection Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders code snippet, language, and custom title', () => {
    render(
      <CodeBlock
        code="curl https://api.apihub.vn/api/gateway/1/test"
        language="bash"
        title="cURL Request Example"
      />
    );

    expect(screen.getByText('cURL Request Example')).toBeDefined();
    expect(screen.getByText(/curl https:\/\/api\.apihub\.vn\/api\/gateway\/1\/test/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Copy code/i })).toBeDefined();
  });

  it('copies code to clipboard successfully and displays feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <CodeBlock
        code="const res = await fetch('/api/gateway/1');"
        language="javascript"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copy code/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("const res = await fetch('/api/gateway/1');");
    });

    expect(await screen.findByText('Copied')).toBeDefined();
    expect(screen.getByRole('button', { name: /Copied code/i })).toBeDefined();
  });

  it('handles clipboard writeText rejection gracefully and displays failed feedback', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <CodeBlock
        code="import requests; res = requests.get('https://example.com')"
        language="python"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copy code/i });
    fireEvent.click(copyBtn);

    expect(await screen.findByText('Failed')).toBeDefined();
    expect(screen.getByRole('button', { name: /Copy failed/i })).toBeDefined();
  });

  it('handles missing clipboard API gracefully without crashing the component tree', async () => {
    // Delete clipboard API
    Object.assign(navigator, {
      clipboard: undefined,
    });

    render(
      <CodeBlock
        code="SELECT * FROM telemetry;"
        language="sql"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copy code/i });
    fireEvent.click(copyBtn);

    expect(await screen.findByText('Failed')).toBeDefined();
    expect(screen.getByRole('button', { name: /Copy failed/i })).toBeDefined();
  });
});
