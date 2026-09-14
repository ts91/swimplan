resource "google_compute_address" "swimplan" {
  name       = "swimplan-ip"
  depends_on = [google_project_service.compute]
}

resource "google_compute_firewall" "swimplan_allow_web" {
  name    = "swimplan-allow-web"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["swimplan"]

  depends_on = [google_project_service.compute]
}

resource "google_compute_instance" "swimplan" {
  name         = "swimplan"
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["swimplan"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = var.disk_size_gb
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.swimplan.address
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_pub_key}"
  }

  metadata_startup_script = templatefile("${path.module}/cloud-init.yaml", {
    repo_url             = var.repo_url
    db_password          = random_password.db_password.result
    jwt_secret           = var.jwt_secret
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
    external_ip          = google_compute_address.swimplan.address
  })

  service_account {
    scopes = ["logging-write", "monitoring-write"]
  }

  depends_on = [google_project_service.compute]
}
