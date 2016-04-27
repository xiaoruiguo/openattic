# -*- coding: utf-8 -*-
"""
 *  Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""

from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from rest_framework import serializers, viewsets

from nodb.models import NodbModel


class NodbSerializer(serializers.ModelSerializer):

    class Meta:
        model = NodbModel


class NodbViewSet(viewsets.ModelViewSet):
    serializer_class = NodbSerializer

    def paginate(self, iterable, request):
        """Automatically paginates the given set of items according to the given request."""

        page_size = request.QUERY_PARAMS.get('pageSize', 10)
        page = request.QUERY_PARAMS.get('pages', 1)

        paginator = Paginator(iterable, page_size)
        try:
            iterable = paginator.page(page)
        except PageNotAnInteger:
            iterable = paginator.page(1)
        except EmptyPage:
            # The list index is out of range, so take the last page and display it.
            iterable = paginator.page(paginator.num_pages)

        return iterable
