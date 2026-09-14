output "app_url" {
  description = "Public URL of the Swimplan application"
  value       = "http://${google_compute_address.swimplan.address}"
}

output "external_ip" {
  description = "Static external IP address"
  value       = google_compute_address.swimplan.address
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ${var.ssh_user}@${google_compute_address.swimplan.address}"
}
