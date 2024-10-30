```mermaid
classDiagram
    class User {
        +string username
        +string email
        +string password
        +RoleTypes role
        +StatusUser status
        +number reputation
        +Date timestamp
        +User[] friends
        +Channel[] channels
        +Message[] messages
    }

    class Channel {
        +string name
        +string type
        +boolean isPrivate
        +boolean isSafeMode
        +string[] bannedWords
        +Date timestamp
        +User owner
        +User[] members
        +User[] moderators
        +Message[] messages
    }

    class Message {
        +string content
        +string type
        +Date editedAt
        +Date deletedAt
        +Date createdAt
        +Date updatedAt
        +User sender
        +User[] readBy
        +Channel channel
        +Conversation conversation
    }

    class Conversation {
        +User[] participants
        +Message[] messages
        +Date createdAt
    }

    class FriendRequest {
        +User sender
        +User recipient
        +FriendRequestStatus status
        +Date timestamp
    }

    class FriendRequestStatus {
        <<enumeration>>
        PENDING
        ACCEPTED
        DECLINED
    }

    class RoleTypes {
        <<enumeration>>
        USER
    }

    class StatusUser {
        <<enumeration>>
        OFFLINE
        ONLINE
        BANNED
    }

    User "1" --> "*" Channel : owns
    User "1" --> "*" Message : sends
    User "*" --> "*" Channel : is member of
    User "*" --> "*" Channel : moderates
    User "1" -- "*" FriendRequest : sends/receives
    User "*" --> "*" Conversation : participates
    Channel "1" --> "*" Message : contains
    Conversation "1" --> "*" Message : contains
    Message "*" --> "*" User : read by
    FriendRequest --> FriendRequestStatus : has status
    User --> RoleTypes : has role
    User --> StatusUser : has status