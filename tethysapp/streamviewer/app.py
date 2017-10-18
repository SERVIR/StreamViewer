from tethys_sdk.base import TethysAppBase, url_map_maker


class Streamviewer(TethysAppBase):
    """
    Tethys app class for Stream Viewer.
    """

    name = 'Stream Viewer Alpha'
    index = 'streamviewer:home'
    icon = 'streamviewer/images/icon.gif'
    package = 'streamviewer'
    root_url = 'streamviewer'
    color = '#2c3e50'
    description = 'View animated streams'
    tags = 'Hydrology'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='streamviewer',
                controller='streamviewer.controllers.home'
            ),
        )

        return url_maps
