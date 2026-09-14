variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region (must be free-tier eligible)"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "machine_type" {
  description = "Compute Engine machine type"
  type        = string
  default     = "e2-micro"
}

variable "disk_size_gb" {
  description = "Boot disk size in GB (free tier allows up to 30)"
  type        = number
  default     = 20
}

variable "ssh_pub_key" {
  description = "SSH public key for VM access (e.g. contents of ~/.ssh/id_ed25519.pub)"
  type        = string
}

variable "ssh_user" {
  description = "SSH username"
  type        = string
  default     = "deploy"
}

variable "repo_url" {
  description = "Git repository URL to clone on the VM"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}
