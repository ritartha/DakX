from django.contrib import admin

from .models import Attachment, Folder, Label, MailboxEntry, Message, Thread

admin.site.register(Label)
admin.site.register(Thread)
admin.site.register(Message)
admin.site.register(MailboxEntry)
admin.site.register(Folder)
admin.site.register(Attachment)
