from api.supabase_client import supabase

TABLE = "garbage_routes"


def get_all_garbage_routes():
    response = supabase.table(TABLE).select("*").execute()
    return response.data if response.data else []


def get_garbage_route(route_id: int):
    response = (
        supabase.table(TABLE)
        .select("*")
        .eq("route_id", route_id)
        .single()
        .execute()
    )

    if response.error:
        return None

    return response.data


def create_garbage_route(data: dict):
    response = supabase.table(TABLE).insert(data).execute()

    if response.error:
        raise Exception(response.error.message)

    return response.data[0]


def update_garbage_route(route_id: int, data: dict):
    response = (
        supabase.table(TABLE)
        .update(data)
        .eq("route_id", route_id)
        .execute()
    )

    if response.error:
        raise Exception(response.error.message)

    return response.data[0] if response.data else None


def delete_garbage_route(route_id: int):
    response = (
        supabase.table(TABLE)
        .delete()
        .eq("route_id", route_id)
        .execute()
    )

    if response.error:
        raise Exception(response.error.message)

    return bool(response.data)