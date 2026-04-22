from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    """Represent a single chat message."""

    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    """Validate chatbot requests."""

    message = serializers.CharField(max_length=2000)
    history = ChatMessageSerializer(many=True, required=False, default=list)


class ProductDescriptionRequestSerializer(serializers.Serializer):
    """Validate product description generation input."""

    tone = serializers.ChoiceField(
        choices=['professional', 'marketing', 'short'],
        required=False,
        default='professional',
    )