const userData = {
  user: {
    name: 'Kyle Tomanelli',
    profilePic:
      'https://media-exp1.licdn.com/dms/image/C4D35AQGJnFw6pNenZQ/profile-framedphoto-shrink_200_200/0?e=1603040400&v=beta&t=JdNnT3SMbu6YluRRWcJpppS-a7yethyaGw-NeyPuzkM',
  },
  links: [
    { name: 'Personal Site', url: 'https://kyletomanelli.com' },
    { name: 'Blog Site', url: 'https://technicode.io' },
    { name: 'Recent Project', url: 'https://shape.studio' },
  ],
  social: [
    {
      img: 'https://simpleicons.org/icons/twitter.svg',
      url: 'https://twitter.com/kyletomanelli',
      alt: 'Twitter Icon',
    },
    {
      img: 'https://simpleicons.org/icons/github.svg',
      url: 'https://github.com/ktomanelli',
      alt: 'Github Icon',
    },
    {
      img: 'https://simpleicons.org/icons/linkedin.svg',
      url: 'https://linkedin.com/in/kyletomanelli',
      alt: 'LinkedIn Icon',
    },
  ],
}
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
class DocTransformer {
  constructor(userData) {
    this.userData = userData
  }

  async element(element) {
    switch (element.tagName) {
      case 'title':
        element.setInnerContent(this.userData.user.name)
        break
      case 'body':
        element.setAttribute('class', 'bg-gray-600')
        break
      case 'h1':
        element.append(this.userData.user.name)
        break
      case 'img':
        element.setAttribute('src', this.userData.user.profilePic)
        element.setAttribute('alt', 'Profile Picture')
        break
      case 'div':
        switch (element.getAttribute('id')) {
          case 'links':
            this.userData.links.map(link =>
              element.append(
                `<a href='${link.url}' target='_blank'>${link.name}</a>`,
                {
                  html: true,
                }
              )
            )
            break
          case 'profile':
            element.removeAttribute('style')
            break
          case 'social':
            element.removeAttribute('style')
            this.userData.social.map(social =>
              element.append(
                `<a href='${social.url}'><img src='${social.img}' alt='${social.alt}'/></a>`,
                { html: true }
              )
            )
            break
          default:
            break
        }
        break
      default:
        break
    }
  }
}

async function handleRequest(request) {
  const url = new URL(request.url)
  if (url.pathname === '/links') {
    return new Response(JSON.stringify({ links: userData.links }), {
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    })
  }
  const transformer = new DocTransformer(userData)
  const rewiter = new HTMLRewriter()
    .on('div#links', transformer)
    .on('div#profile', transformer)
    .on('img#avatar', transformer)
    .on('h1#name', transformer)
    .on('div#social', transformer)
    .on('title', transformer)
    .on('body', transformer)
  const staticPage = await fetch(
    'https://static-links-page.signalnerve.workers.dev'
  )
  return rewiter.transform(staticPage)
}
