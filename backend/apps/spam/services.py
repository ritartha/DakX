from .models import SpamReport


class SpamService:
    @staticmethod
    def report(reporter, message, reason: str) -> SpamReport:
        return SpamReport.objects.create(reporter=reporter, message=message, reason=reason)
