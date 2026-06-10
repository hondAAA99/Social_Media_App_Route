import availabiltyEnum from "../enum/availablity.enum.js";
export function postAvailability(req) {
    return [
        {
            availablity: availabiltyEnum.onlyMe,
        },
        {
            availablity: availabiltyEnum.public,
        },
        {
            availablity: availabiltyEnum.friends,
            createdBy: { $in: req.user?.friends.data ?? [] },
        },
        {
            tags: { $in: [req?.user?.id] },
        },
    ];
}
export function userDataAvailability(req) {
    return [
        {
            availablity: availabiltyEnum.onlyMe,
        },
        {
            availablity: availabiltyEnum.public,
        },
        {
            availablity: availabiltyEnum.friends,
            createdBy: { $in: req.user?.friends.data ?? [] },
        },
    ];
}
export function searchQuery(req) {
    return {
        content: req?.query?.search
            ? {
                $regex: req?.query?.search,
                $options: "i",
            }
            : {},
    };
}
