export default function MenuPanel() {
  const closeOverlay = () => {
    window.indexBridge?.overlay.closeOverlay(() => {
      console.log('closed overlay')
    })
  }
  const primaryItems = [
    {
      type: 'action',
      title: 'New tab',
      keybind: 'Ctrl+T',
      action: () => {
        console.log('?????')
        window.indexBridge?.tabs.newTab(() => {
          console.log('new tab')
          closeOverlay()
        })
      }
    },
    {
      type: 'action',

      title: 'New window',
      keybind: 'Ctrl+N',
      action: () => {
        window.indexBridge?.window.createWindow(() => {
          closeOverlay()
        }, [])
      }
    },
    {
      type: 'action',
      title: 'New private window',
      keybind: 'Ctrl+Shift+A',
      action: () => {
        window.indexBridge?.window.createWindow(
          () => {
            closeOverlay()
          },
          [],
          false,
          false,
          true
        )
      }
    }
  ]
  const secondaryItems = [
    {
      type: 'link',
      title: 'History',
      link: 'history',
      action: () => {
        window.indexBridge?.settings.openSettings(() => {
          closeOverlay()
        }, 'history')
      }
    },
    {
      type: 'link',
      title: 'Sync',
      link: 'sync',
      action: () => {
        window.indexBridge?.settings.openSettings(() => {
          closeOverlay()
        }, 'sync')
      }
    },
    {
      type: 'link',
      title: 'Settings',
      link: 'settings',
      action: () => {
        window.indexBridge?.settings.openSettings(() => {
          closeOverlay()
        }, 'settings')
      }
    }
  ]
  const itemComponent = (item: any) => {
    return (
      <div className="mx-auto p-1 px-2">
        <div
          className="hover:bg-s-blue hover:bg-opacity-20 justify-between flex p-2 rounded-lg hover:cursor-pointer"
          onClick={() => {
            if (item.action !== undefined) {
              item.action()
            }
          }}
        >
          <h1 className="my-auto text-sm truncate">{item.title}</h1>
          {item.type === 'action' ? (
            <h2 className="text-sm mt-auto">{item.keybind ?? ''}</h2>
          ) : (
            <></>
          )}
        </div>
      </div>
    )
  }
  const separator = () => {
    return <div className="h-0.5 rounded-2xl mx-2 bg-s-blue"></div>
  }
  return (
    <div className="pt-2">
      {itemComponent({
        type: 'link',
        title: 'alexander.j.heatherwdwqdwqd@gmail.com',
        link: 'profile'
      })}
      {separator()}
      {primaryItems.map((item) => itemComponent(item))}
      {separator()}
      {secondaryItems.map((item: any) => itemComponent(item))}
    </div>
  )
}
