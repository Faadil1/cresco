import {
  handleCrescoVercelRequest,
  vercelApiPathFromQuery
} from '../../src/vercel-adapter.mjs';

export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  return handleCrescoVercelRequest({
    req,
    res,
    path: vercelApiPathFromQuery(req.query)
  });
}
