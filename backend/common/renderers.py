from rest_framework.renderers import JSONRenderer


class DakXJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        payload = {
            'status': response.status_code if response else 200,
            'data': data,
        }
        return super().render(payload, accepted_media_type, renderer_context)
