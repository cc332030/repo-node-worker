
const repos = [

  'https://registry.npmjs.org',

]

const hiddenErrorCodes = [
  401
]

const urlPrefix = '://'

function getPath(url) {

  const url2 = url.substring(url.indexOf(urlPrefix) + urlPrefix.length)
  return url2.substring(url2.indexOf('/'))
}

function assign(obj1, obj2) {
  return Object.assign({}, obj1, obj2)
}

export default {
  async fetch(request, env, ctx) {

    const path = getPath(request.url)

    const failResponses = []
    for (const repo of repos) {

      const newUrl = `${repo}${path}`
      console.debug('newUrl', newUrl)

      const requestHeaders = request.headers
      console.debug('headers', requestHeaders)

      const response = await fetch(newUrl, {
        method: request.method,
        redirect: 'follow',
        headers: requestHeaders,
      })
      console.debug('response', response)

      const ok = response.ok
      console.debug('ok', ok)
      if(ok) {

        const responseHeaders = {
          'c-repo': repo,
          'c-url': response.url,
        }

        for (const pair of response.headers.entries()) {
          responseHeaders[pair[0]] = pair[1]
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        })
      }

      failResponses.push(response)

    }

    for (const res of failResponses) {
      if(hiddenErrorCodes.includes(res.status)) {
        continue
      }
      return res;
    }

    return new Response(`${path} not found.`, {
      status: 404,
    });
  }
};
